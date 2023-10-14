package model

type SocialMediaPostData struct {
	Items []SocialMediaPost `json:"items"`
}

type SocialMediaPost struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	Media    string `json:"media"`
	Avatar   string `json:"avatar"`
	Date     string `json:"date"`
	Target   string `json:"target"`
	URL      string `json:"url"`
	Likes    int    `json:"likes"`
	Replies  int    `json:"replies"`
	Retweets int    `json:"retweets"`
}

type SocialMediaPostEntityData struct {
	Posts []SocialMediaPostEntity `json:"posts"`
}

type SocialMediaPostEntity struct {
	ID                  string                `json:"id"`
	Content             string                `json:"content"`
	Media               string                `json:"media"`
	Date                string                `json:"date"`
	AssociatedComponent string                `json:"associated_component"`
	Retweets            int                   `json:"retweets"`
	Likes               int                   `json:"likes"`
	Replies             int                   `json:"replies"`
	Hashtags            []string              `json:"hashtags"`
	URL                 string                `json:"url"`
	User                SocialMediaUserEntity `json:"user"`
}

type SocialMediaUserEntity struct {
	Handle         string `json:"handle"`
	Name           string `json:"name"`
	ProfilePicture string `json:"profile_picture"`
	Bio            string `json:"bio"`
	FollowersCount int    `json:"follower_count"`
	FollowingCount int    `json:"following_count"`
}
