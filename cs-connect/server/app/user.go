package app

type UserResult struct {
	Users []User `json:"users"`
}

type User struct {
	UserID    string `json:"userId"`
	Username  string `json:"username"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}
