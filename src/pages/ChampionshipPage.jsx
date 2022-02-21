import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { apiGetChampionshipDataFrom } from '../api/apiChampionships';
import Loading from '../components/Loading';
import Ranking from '../components/Ranking';
import Title from '../components/Title';

export default function ChampionshipPage() {
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState([]);

  const { pathname } = useLocation();
  const year = parseInt(pathname.substring(1), 10);

  useEffect(() => {
    /**
     * Assumo que esta página
     * está visível no DOM
     */
    let pageInDOM = true;

    async function getChampionshipData() {
      const dataFromYear = await apiGetChampionshipDataFrom(year);

      /**
       * Só troco o estado se a
       * página se mantiver no
       * DOM, pois ela pode ter
       * sido "trocada" enquanto
       * a requisição ainda estava
       * sendo feita
       */
      if (pageInDOM) {
        setRanking(dataFromYear);

        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    }

    getChampionshipData();

    /**
     * Cleanup function do useEffect,
     * onde indicamos que a página
     * não está mais no DOM
     */
    return () => (pageInDOM = false);
  }, [year]);

  if (loading) {
    return (
      <div className="text-center mt-8">
        <Loading />
      </div>
    );
  }

  return (
    <div>
      <Title>Campeonato Brasileiro de {year}</Title>

      <section className="my-4">
        <Ranking>{ranking}</Ranking>
      </section>
    </div>
  );
}
