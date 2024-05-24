package data

import "embed"

//go:embed *.json *.xlsx *.csv
var Data embed.FS
