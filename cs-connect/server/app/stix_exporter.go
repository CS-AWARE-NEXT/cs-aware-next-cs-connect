package app

import "net/http"

type Exporter interface {
	FileName(name string) string
	ContentType() string
	Export(w http.ResponseWriter, stixChannel *STIXChannel, download bool)
}
