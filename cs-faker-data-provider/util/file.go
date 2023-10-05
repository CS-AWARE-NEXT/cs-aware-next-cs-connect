package util

import (
	"io/fs"
	"strings"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/data"
)

func GetEmbeddedFilePath(fileName, extension string) (string, error) {
	filePaths, err := fs.Glob(data.Data, extension)
	if err != nil {
		return "", err
	}
	for _, filePath := range filePaths {
		if strings.Contains(filePath, fileName) {
			return filePath, nil
		}
	}
	return "", err
}
