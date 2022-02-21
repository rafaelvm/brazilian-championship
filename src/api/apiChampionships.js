import {
  helperFormatTeamName,
  helperGetImageNameFrom,
} from '../helpers/helpers';

import { httpServiceGet } from '../services/httpService';

const CACHE = [];

function getStatistics(data) {
  const {
    total_derrotas,
    total_empates,
    total_vitorias,
    total_pontos,
    total_gols_marcados,
    total_gols_sofridos,
  } = data;

  const balanceGoals = total_gols_marcados - total_gols_sofridos;

  return {
    points: total_pontos,
    victories: total_vitorias,
    draws: total_empates,
    defeats: total_derrotas,
    goalsScored: total_gols_marcados,
    goalsTaken: total_gols_sofridos,
    balanceGoals,
  };
}

function getRankingFrom(rawData) {
  const ranking = rawData[rawData.length - 1].partidas
    .map(
      ({
        mandante,
        visitante,
        pontuacao_geral_mandante,
        pontuacao_geral_visitante,
      }) => {
        const hostData = getStatistics(pontuacao_geral_mandante);
        const visitorData = getStatistics(pontuacao_geral_visitante);

        return [
          {
            teamName: helperFormatTeamName(mandante),
            imageUrl: helperGetImageNameFrom(mandante),
            data: hostData,
          },
          {
            teamName: helperFormatTeamName(visitante),
            imageUrl: helperGetImageNameFrom(visitante),
            data: visitorData,
          },
        ];
      }
    )
    .flat()
    .sort((a, b) => b.data.points - a.data.points);

  return ranking;
}

export async function apiGetChampionshipDataFrom(year) {
  if (CACHE[year]) {
    console.log(`Obtendo dados de ${year} através do cache.`);
    return CACHE[year];
  }

  const data = await httpServiceGet(`http://localhost:3001/${year}`);
  const ranking = getRankingFrom(data);

  CACHE[year] = ranking;

  console.log(`Obtendo dados de ${year} através do backend.`);
  return ranking;
}

// Utilizei a função abaixo para verificar se eu havia de fato
// obtido as imagens dos escudos de todos os times entre 2003
// e 2015

// export async function apiGetUniqueTeams() {
//   if (CACHE['unique_teams']) {
//     return CACHE['unique_teams'];
//   }

//   let uniqueTeams = [];

//   for (let year = 2003; year <= 2015; year++) {
//     const data = await apiGetChampionshipDataFrom(year);

//     let championshipTeams = data.rounds
//       .map(round => {
//         return round.partidas
//           .map(({ mandante, visitante }) => {
//             return [mandante, visitante];
//           })
//           .flat();
//       })
//       .flat();

//     uniqueTeams.push(...championshipTeams);
//   }

//   uniqueTeams = Array.from(new Set(uniqueTeams))
//     .sort((a, b) => a.localeCompare(b))
//     .map(team => {
//       return {
//         original: team,
//         name: formatTeam(team),
//         image: helperGetImageName(team),
//       };
//     });

//   CACHE['unique_teams'] = uniqueTeams;

//   return uniqueTeams;
// }
