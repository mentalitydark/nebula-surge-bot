import { env } from '@/infrastructure/env'

const isProduction = env.NODE_ENV === 'production'

export const channelsId = {
  autoBan: isProduction ? ['1524235650306408469', '1269797168076689471'] : ['1482235200267358460', '1482235200267358468'],
  autoBanVote: isProduction ? '1523064505649594499' : '1482235200649035848',
  logs: isProduction ? '1523064238321696898' : '1482235200649035850',
  messagesRemoved: isProduction ? '1520986561775276164' : '1482235200649035850'
}

export const rolesId = {
  autoBan: isProduction ? '1523052836735156378' : '1523016029020881099',
  executor: isProduction ? '1207386038322995270' : '1482235198736437269',
  strikesLevels: isProduction ? [
    { level: 1, roleId: '1333939069390159872' },
    { level: 2, roleId: '1333939267210313758' }
  ] : [
    { level: 1, roleId: '1537096462125629480' },
    { level: 2, roleId: '1537096502206533785' },
    { level: 3, roleId: '1537096543843393667' }
  ]
}

export const autoBanMinimumVotes = 1;