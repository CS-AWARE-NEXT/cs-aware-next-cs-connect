package app

import "github.com/pkg/errors"

// ErrNotFound is used when an entity is not found.
var ErrNotFound = errors.New("not found")
