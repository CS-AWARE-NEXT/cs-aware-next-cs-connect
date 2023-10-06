package model

type SocialMediaPostData struct {
	Items []SocialMediaPost `json:"items"`
}

type SocialMediaPost struct {
	ID      string `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
	Media   string `json:"media"`
	Avatar  string `json:"avatar"`
}

type SocialMediaPostEntity struct {
	ID       string                `json:"id"`
	Content  string                `json:"content"`
	Retweets int                   `json:"retweets"`
	Likes    int                   `json:"likes"`
	Replies  int                   `json:"replies"`
	Hashtags []string              `json:"hashtags"`
	URL      string                `json:"url"`
	User     SocialMediaUserEntity `json:"user"`
}

type SocialMediaUserEntity struct {
	Handle         string `json:"handle"`
	Name           string `json:"name"`
	ProfilePicture string `json:"profile_picture"`
	Bio            string `json:"bio"`
	FollowersCount int    `json:"follower_count"`
	FollowingCount int    `json:"following_count"`
}
