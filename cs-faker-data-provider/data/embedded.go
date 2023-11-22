package data

import "embed"

//go:embed *.json *.xlsx
var Data embed.FS
