import { useState } from 'react';
import type { FormEvent } from 'react';

import { t } from '@extension/i18n';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';

import type { InstaQLEntity } from '@instantdb/react';
import { id, i, init } from '@instantdb/react';

import '@src/NewTab.css';
import '@src/NewTab.scss';

// ID for app: starter
const APP_ID = '8bbd43a4-c7ee-4291-b013-3e8de03b7542';

// Optional: Declare your schema!
const schema = i.schema({
  entities: {
    todos: i.entity({
      text: i.string(),
      done: i.boolean(),
      createdAt: i.number(),
    }),
  },
});

type Todo = InstaQLEntity<typeof schema, 'todos'>;

const db = init({ appId: APP_ID, schema });

const NewTab = () => {
  const theme = useStorage(exampleThemeStorage);
  console.log('theme', theme);
  console.log(t('hello', 'World'));

  const { isLoading, error, data } = db.useQuery({ todos: {} });
  if (isLoading) {
    return;
  }
  if (error) {
    return <div>Error querying data: {error.message}</div>;
  }
  const { todos } = data;

  return (
    <div className={`App bg-gray-800'}`}>
      <header className={`App-header text-gray-100'}`}>
        <div style={styles.container}>
          <div style={styles.header}>todos</div>
          <TodoForm todos={todos} />
          <TodoList todos={todos} />
          <ActionBar todos={todos} />
          <div style={styles.footer}>Open another tab to see todos update in realtime!</div>
        </div>
      </header>
    </div>
  );
};

// Write Data
// ---------
function addTodo(text: string) {
  db.transact(
    db.tx.todos[id()].update({
      text,
      done: false,
      createdAt: Date.now(),
    }),
  );
}

function deleteTodo(todo: Todo) {
  db.transact(db.tx.todos[todo.id].delete());
}

function toggleDone(todo: Todo) {
  db.transact(db.tx.todos[todo.id].update({ done: !todo.done }));
}

function deleteCompleted(todos: Todo[]) {
  const completed = todos.filter(todo => todo.done);
  const txs = completed.map(todo => db.tx.todos[todo.id].delete());
  db.transact(txs);
}

function toggleAll(todos: Todo[]) {
  const newVal = !todos.every(todo => todo.done);
  db.transact(todos.map(todo => db.tx.todos[todo.id].update({ done: newVal })));
}

// Components
// ----------
function TodoForm({ todos }: { todos: Todo[] }) {
  const [todo, setTodo] = useState('');
  return (
    <div style={styles.form}>
      <div style={styles.toggleAll} onClick={() => toggleAll(todos)} role="button">
        ⌄
      </div>
      <form
        onSubmit={(e: FormEvent<HTMLFormElement>): void => {
          e.preventDefault();
          console.log(e.target);
          if (!todo) return;
          addTodo(todo);

          setTodo('');
        }}>
        <input
          style={styles.input}
          autoFocus
          placeholder="What needs to be done?"
          type="text"
          value={todo}
          onChange={e => setTodo(e.target.value)}
        />
      </form>
    </div>
  );
}

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <div style={styles.todoList}>
      {todos.map(todo => (
        <div key={todo.id} style={styles.todo}>
          <input
            type="checkbox"
            key={todo.id}
            style={styles.checkbox}
            checked={todo.done}
            onChange={() => toggleDone(todo)}
          />
          <div style={styles.todoText}>
            {todo.done ? <span style={{ textDecoration: 'line-through' }}>{todo.text}</span> : <span>{todo.text}</span>}
          </div>
          <span onClick={() => deleteTodo(todo)} style={styles.delete}>
            𝘟
          </span>
        </div>
      ))}
    </div>
  );
}

function ActionBar({ todos }: { todos: Todo[] }) {
  return (
    <div style={styles.actionBar}>
      <div>Remaining todos: {todos.filter(todo => !todo.done).length}</div>
      <div style={{ cursor: 'pointer' }} onClick={() => deleteCompleted(todos)}>
        Delete Completed
      </div>
    </div>
  );
}

// Styles
// ----------
const styles: Record<string, React.CSSProperties> = {
  container: {
    boxSizing: 'border-box',
    fontFamily: 'code, monospace',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  header: {
    letterSpacing: '2px',
    fontSize: '50px',
    color: 'lightgray',
    marginBottom: '10px',
  },
  form: {
    boxSizing: 'inherit',
    display: 'flex',
    border: '1px solid lightgray',
    borderBottomWidth: '0px',
    width: '350px',
  },
  toggleAll: {
    fontSize: '30px',
    cursor: 'pointer',
    marginLeft: '11px',
    marginTop: '-6px',
    width: '15px',
    marginRight: '12px',
  },
  input: {
    backgroundColor: 'transparent',
    fontFamily: 'code, monospace',
    width: '287px',
    padding: '10px',
    fontStyle: 'italic',
  },
  todoList: {
    boxSizing: 'inherit',
    width: '350px',
  },
  checkbox: {
    fontSize: '30px',
    marginLeft: '5px',
    marginRight: '20px',
    cursor: 'pointer',
  },
  todo: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    border: '1px solid lightgray',
    borderBottomWidth: '0px',
  },
  todoText: {
    flexGrow: '1',
    overflow: 'hidden',
  },
  delete: {
    width: '25px',
    cursor: 'pointer',
    color: 'lightgray',
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '328px',
    padding: '10px',
    border: '1px solid lightgray',
    fontSize: '10px',
  },
  footer: {
    marginTop: '20px',
    fontSize: '10px',
  },
};

export default withErrorBoundary(withSuspense(NewTab, <div>{t('loading')}</div>), <div> Error Occur </div>);
