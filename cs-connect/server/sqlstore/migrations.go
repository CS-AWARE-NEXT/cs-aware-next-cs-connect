package sqlstore

import (
	"github.com/blang/semver"
	"github.com/jmoiron/sqlx"
	"github.com/mattermost/mattermost-server/v6/model"
	"github.com/pkg/errors"
)

type Migration struct {
	fromVersion   semver.Version
	toVersion     semver.Version
	migrationFunc func(sqlx.Ext, *SQLStore) error
}

const MySQLCharset = "DEFAULT CHARACTER SET utf8mb4"

var migrations = []Migration{
	{
		fromVersion: semver.MustParse("0.0.0"),
		toVersion:   semver.MustParse("0.1.0"),
		migrationFunc: func(e sqlx.Ext, sqlStore *SQLStore) error {
			if e.DriverName() == model.DatabaseDriverMysql {
				if _, err := e.Exec(`
					CREATE TABLE IF NOT EXISTS CSA_System (
						SKey VARCHAR(64) PRIMARY KEY,
						SValue VARCHAR(1024) NULL
					)
				` + MySQLCharset); err != nil {
					return errors.Wrapf(err, "failed creating table CSA_System")
				}

				if _, err := e.Exec(`
					CREATE TABLE IF NOT EXISTS CSA_Channel (
						ChannelID VARCHAR(26) PRIMARY KEY,
						ParentID VARCHAR(26) NOT NULL,
						SectionID VARCHAR(26) NOT NULL
					)
				` + MySQLCharset); err != nil {
					return errors.Wrapf(err, "failed creating table CSA_Channel")
				}
			} else {
				if _, err := e.Exec(`
					CREATE TABLE IF NOT EXISTS CSA_System (
						SKey VARCHAR(64) PRIMARY KEY,
						SValue VARCHAR(1024) NULL
					);
				`); err != nil {
					return errors.Wrapf(err, "failed creating table CSA_System")
				}

				if _, err := e.Exec(`
					CREATE TABLE IF NOT EXISTS CSA_Channel (
						ChannelID TEXT PRIMARY KEY,
						ParentID TEXT NOT NULL,
						SectionID TEXT NOT NULL
					);
				`); err != nil {
					return errors.Wrapf(err, "failed creating table CSA_Channel")
				}
			}

			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.1.0"),
		toVersion:   semver.MustParse("0.2.0"),
		migrationFunc: func(e sqlx.Ext, sqlStore *SQLStore) error {
			// prior to v1.0.0 of the plugin, this migration was used to trigger the data migration from the kvstore
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.2.0"),
		toVersion:   semver.MustParse("0.3.0"),
		migrationFunc: func(e sqlx.Ext, sqlStore *SQLStore) error {
			if e.DriverName() == model.DatabaseDriverMysql {
				if _, err := e.Exec(`ALTER TABLE CSA_System CONVERT TO CHARACTER SET utf8mb4`); err != nil {
					return errors.Wrapf(err, "failed to migrate character set")
				}
			}
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.3.0"),
		toVersion:   semver.MustParse("0.4.0"),
		migrationFunc: func(e sqlx.Ext, sqlStore *SQLStore) error {
			if _, err := e.Exec(`ALTER TABLE CSA_Channel ADD OrganizationID VARCHAR(26) NULL`); err != nil {
				return errors.Wrapf(err, "failed to add organization ID column to CSA channels")
			}
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.4.0"),
		toVersion:   semver.MustParse("0.5.0"),
		migrationFunc: func(e sqlx.Ext, sqlStore *SQLStore) error {
			if e.DriverName() == model.DatabaseDriverMysql {
				if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSA_Backlinks (
					ID TEXT PRIMARY KEY,
					PostID VARCHAR(26) NOT NULL,
					ElementLinkPart VARCHAR(300) NOT NULL,
					ElementMarkdownPath VARCHAR(300) NOT NULL,
					INDEX (ElementLinkPart),
					INDEX (ElementMarkdownPath)
				)
			` + MySQLCharset); err != nil {
					return errors.Wrapf(err, "failed creating table CSA_Backlinks")
				}
			} else {
				if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSA_Backlinks (
					ID TEXT PRIMARY KEY,
					PostID VARCHAR(26) NOT NULL,
					ElementLinkPart VARCHAR(300) NOT NULL,
					ElementMarkdownPath VARCHAR(300) NOT NULL
				);

				CREATE INDEX CSA_Backlinks_Element_ID_idx ON CSA_Backlinks (ElementLinkPart ASC);
				CREATE INDEX CSA_Backlinks_Element_Path_idx ON CSA_Backlinks (ElementMarkdownPath ASC);
				`); err != nil {
					return errors.Wrapf(err, "failed creating table CSA_Backlinks")
				}
			}
			return nil
		},
	},
}
