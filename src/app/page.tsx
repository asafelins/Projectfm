"use client";
import React, { useEffect, useState } from 'react';
import TabelaFilmes from './components/table';
import LoadingSpinner from './components/loading';

const Home: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [filmes, setFilms] = useState<Array<any>>([]);

  useEffect(() => {
    async function __init__() {
      const res = await fetch('/api/films', {
        method: 'GET',
      });
      const data = await res.json();
      setFilms(data.data);
      setLoading(false);
    }

    __init__();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <TabelaFilmes data={filmes} />
    </>
  );
};

export default Home;
