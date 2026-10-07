// Equipes dos departamentos: quem é "membro da equipe" tem os mesmos
// poderes do líder do departamento (exceto montar a equipe, que é do líder).
export const TEAMS = {
    avancai: { leader: 'avancai_lider', team: 'avancai_equipe' },
    christian_group: { leader: 'christian_group_lider', team: 'christian_group_equipe' },
    midia: { leader: 'midia_lider', team: 'midia_equipe' },
    cura: { leader: 'secretaria_cura', team: 'cura_equipe' },
    financeiro: { leader: 'tesouraria', team: 'tesouraria_equipe' },
    facilitadores: { leader: 'facilitador', team: 'facilitadores_equipe' },
}

export const TEAM_ROLES = Object.values(TEAMS).map((t) => t.team)

// Quem pode montar a equipe de qualquer departamento da própria igreja
const CHURCH_MANAGERS = ['pastor_local', 'secretaria_igreja']

// Cargos efetivos: cada cargo de equipe vale como o do líder
export function expandRoles(roles = []) {
    const extra = Object.values(TEAMS)
        .filter((t) => roles.includes(t.team))
        .map((t) => t.leader)
    return [...new Set([...roles, ...extra])]
}

// Pode adicionar/remover pessoas da equipe [key]? (cargos reais, não os
// herdados: a equipe não monta a própria equipe)
export function canManageTeam(roles = [], key) {
    const team = TEAMS[key]
    if (!team) return false
    return roles.includes('super_admin') ||
        roles.some((r) => CHURCH_MANAGERS.includes(r)) ||
        roles.includes(team.leader)
}
