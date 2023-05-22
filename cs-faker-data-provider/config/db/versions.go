package db

import (
	"github.com/blang/semver"
	"github.com/pkg/errors"
)

const systemDatabaseVersionKey = "DatabaseVersion"

func LatestVersion() semver.Version {
	return migrations[len(migrations)-1].toVersion
}

func (db *DB) GetCurrentVersion() (semver.Version, error) {
	currentVersionStr, err := db.getSystemValue(db.db, systemDatabaseVersionKey)

	if currentVersionStr == "" {
		return semver.Version{}, nil
	}

	if err != nil {
		return semver.Version{}, errors.Wrapf(err, "failed retrieving the DatabaseVersion key from the IR_System table")
	}

	currentSchemaVersion, err := semver.Parse(currentVersionStr)
	if err != nil {
		return semver.Version{}, errors.Wrapf(err, "unable to parse current schema version")
	}

	return currentSchemaVersion, nil
}

func (db *DB) SetCurrentVersion(e queryExecer, currentVersion semver.Version) error {
	return db.setSystemValue(e, systemDatabaseVersionKey, currentVersion.String())
}
