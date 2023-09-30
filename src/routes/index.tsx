import { For, createResource } from 'solid-js';
import { useRouteData } from 'solid-start';
import { createServerAction$ } from 'solid-start/server';
import { prisma } from '~/lib/prisma';

export function routeData() {
  const [posts] = createResource(async () => {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
    return posts;
  });

  return { posts };
}

export default function Home() {
  const { posts } = useRouteData<typeof routeData>();

  const [createPostActing, createPost] = createServerAction$(
    async (args: FormData) => {
      const title = args.get('title');
      const body = args.get('body');
      if (typeof title !== 'string' || typeof body !== 'string') {
        throw new Error('Invalid form data');
      }

      await prisma.post.create({ data: { title, body } });
    },
  );

  const [deletePostActing, deletePost] = createServerAction$(
    async (id: string) => {},
  );

  const onClickDelete = (id: string) => {
    const confirmed = confirm('Are you sure?');
    if (!confirmed) return;

    deletePost(id);
  };

  return (
    <main class='grid gap-12'>
      <createPost.Form class='grid gap-3 w-full max-w-xl mx-auto'>
        <h2 class='font-bold text-center text-2xl'>Post form</h2>
        <input type='text' name='title' class='border rounded-md p-2' />
        <textarea name='body' rows={2} class='border rounded-md p-2' />
        <button
          type='submit'
          class='rounded-md hover:bg-neutral-200/50 shadow-md transition-colors py-2'
          disabled={createPostActing.pending}
        >
          {createPostActing.pending ? 'Creating...' : 'Create'}
        </button>
      </createPost.Form>

      <hr />

      <ul class='w-full max-w-xl mx-auto grid gap-5'>
        <For each={posts()}>
          {(post) => (
            <li class='p-4 rounded-md shadow-md flex justify-between items-center'>
              <p>{post.title}</p>

              <button
                type='button'
                class='rounded-md hover:opacity-80 transition-opacity bg-red-500 text-white font-bold p-2'
                onClick={() => onClickDelete(post.id)}
              >
                Delete
              </button>
            </li>
          )}
        </For>
      </ul>
    </main>
  );
}
