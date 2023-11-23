package app

import "github.com/mattermost/mattermost-server/v6/model"

type CategoryStore interface {
	DeleteCategories(categories []*model.SidebarCategoryWithChannels) error
}
