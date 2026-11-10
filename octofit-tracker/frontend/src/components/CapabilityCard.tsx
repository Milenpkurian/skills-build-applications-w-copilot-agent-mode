import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type ApiRecord = Record<string, unknown>;
type ViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'success'; items: ApiRecord[] };
type Props = { title: string; description: string; path: string; collection: string };

function isApiRecord(value: unknown): value is ApiRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readItems(response: unknown, collection: string): ApiRecord[] {
  if (!isApiRecord(response) || !Array.isArray(response[collection])) {
    throw new Error('The server returned an invalid response.');
  }

  const items = response[collection].filter(isApiRecord);
  if (items.length !== response[collection].length) {
    throw new Error('The server returned invalid data.');
  }
  return items;
}

function formatLabel(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

function formatValue(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return undefined;
}

export function CapabilityCard({ title, description, path, collection }: Props) {
  const [state, setState] = useState<ViewState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    async function loadItems() {
      try {
        const items = readItems(await getJson<unknown>(path), collection);
        if (active) setState(items.length ? { status: 'success', items } : { status: 'empty' });
      } catch (error) {
        if (active) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'An unexpected error occurred.',
          });
        }
      }
    }

    void loadItems();
    return () => {
      active = false;
    };
  }, [collection, path]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}: {state.message}</p>}
        {state.status === 'empty' && <p>No {title.toLowerCase()} available.</p>}
        {state.status === 'success' && (
          <ul>
            {state.items.map((item, index) => {
              const details = Object.entries(item)
                .filter(([key]) => key !== '_id' && key !== '__v')
                .map(([key, value]) => ({ label: formatLabel(key), value: formatValue(value) }))
                .filter((entry): entry is { label: string; value: string } => entry.value !== undefined);
              return (
                <li key={typeof item._id === 'string' ? item._id : index}>
                  {details.map(({ label, value }) => <span key={label} className="d-block">{label}: {value}</span>)}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
