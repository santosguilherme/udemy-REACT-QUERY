import { useInfiniteQuery } from 'react-query';
import InfiniteScroll from 'react-infinite-scroller';

import { Species } from './Species';

const initialUrl = 'https://swapi.dev/api/species/';
const fetchUrl = async (url) => {
  const response = await fetch(url);
  return response.json();
};

export function InfiniteSpecies() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isError,
    error
  } = useInfiniteQuery(
    'sw-species',
    ({ pageParam = initialUrl }) => fetchUrl(pageParam),
    {
      getNextPageParam: lastPage => lastPage.next || undefined
    }
  );

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (isError) {
    return <div>Error! {error.toString()}</div>;
  }

  return (
    <>
      <h2>Species</h2>
      {isFetching && (<div className="loading">Loading...</div>)}
      <InfiniteScroll loadMore={fetchNextPage} hasMore={hasNextPage}>
        {data.pages.map(pageData => {
          return pageData.results.map(specie => (
            <Species
              key={specie.name}
              name={specie.name}
              averageLifespan={specie.average_lifespan}
              language={specie.language}
            />
          ));
        })}
      </InfiniteScroll>
    </>
  );
}
