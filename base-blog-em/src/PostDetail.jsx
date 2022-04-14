import { useQuery, useMutation } from 'react-query';

async function fetchComments(postId) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/comments?postId=${postId}`
  );
  return response.json();
}

async function deletePost(postId) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/postId/${postId}`,
    { method: 'DELETE' }
  );
  return response.json();
}

async function updatePost(postId) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/postId/${postId}`,
    { method: 'PATCH', data: { title: 'REACT QUERY FOREVER!!!!' } }
  );
  return response.json();
}

export function PostDetail({ post }) {
  const { data, isLoading, isError, error } = useQuery(['comments', post.id], () => fetchComments(post.id));
  const deleteMutation = useMutation(postId => deletePost(postId));
  const updateMutation = useMutation(postId => updatePost(postId));

  return (
    <>
      <h3 style={{ color: 'blue' }}>{post.title}</h3>
      <button onClick={() => deleteMutation.mutate(post.id)}>Delete</button>
      <button onClick={() => updateMutation.mutate(post.id)}>Update title</button>
      {deleteMutation.isError && <p>Error when deleting the post</p>}
      {deleteMutation.isLoading && <p>Deleting the post...</p>}
      {deleteMutation.isSuccess && <p>Post has (not) been deleted!</p>}
      {updateMutation.isError && <p>Error when updating the post</p>}
      {updateMutation.isLoading && <p>Updating the post...</p>}
      {updateMutation.isSuccess && <p>Post has (not) been updated!</p>}
      <p>{post.body}</p>
      <h4>Comments</h4>
      {isLoading && (
        <p>Loading...</p>
      )}
      {isError && (
        <>
          <p>Oops, something went wrong!</p>
          <p>{error.toString()}</p>
        </>
      )}
      {!isLoading && !isError && data.map((comment) => (
        <li key={comment.id}>
          {comment.email}: {comment.body}
        </li>
      ))}
    </>
  );
}
