package util

import (
	"encoding/json"
	"time"
)

func Convert(a, b interface{}) error {
	js, err := json.Marshal(a)
	if err != nil {
		return err
	}
	return json.Unmarshal(js, b)
}

func ConvertUnixMilliToUTC(timestamp int64) string {
	// format := time.RFC3339
	format := "2006-01-02T15:04:05.000000Z"
	return time.UnixMilli(timestamp).UTC().Format(format)
}
