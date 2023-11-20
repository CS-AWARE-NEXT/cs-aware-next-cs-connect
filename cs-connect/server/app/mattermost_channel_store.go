package app

type MattermostChannelStore interface {
	GetChannelsForTeam(teamID string) (GetMattermostChannelsResults, error)
}
