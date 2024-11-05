package main

import (
	"encoding/gob"
	"fmt"
	"io"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/config"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/config/db"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/repository"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/route"
)

func main() {
	err := config.LoadEnv()
	if err != nil {
		log.Fatalf("Error loading ENV file due to %s", err)
	}
	logFile, err := config.UseLogFile(os.Getenv("LOG_DIRNAME"), os.Getenv("LOG_FILENAME"))
	if err != nil {
		log.Fatalf("Cannot config log to file due to %s", err)
	}
	defer func(logFile *os.File) {
		err := logFile.Close()
		if err != nil {
			panic(err)
		}
	}(logFile)
	mw := io.MultiWriter(os.Stdout, logFile)
	log.SetOutput(mw)

	// Used to generalize session management to any type
	gob.Register(map[string]interface{}{})

	// Init provider
	log.Infof("Starting provider for ecosystem with id: %s", os.Getenv("ECOSYSTEM_ID"))

	// Init DB and run migrations
	db, err := db.New(os.Getenv("DATA_SOURCE"), os.Getenv("DRIVER_NAME"))
	if err != nil {
		log.Fatalf("Cannot connect to DB due to %s", err)
	}
	if err = db.RunMigrations(); err != nil {
		log.Fatalf("Failed to run migrations due to %s", err)
	}

	repositoriesMap := map[string]interface{}{
		"issues":         repository.NewIssueRepository(db),
		"cache":          repository.NewCacheRepository(db),
		"ecosystemGraph": repository.NewEcosystemGraphRepository(db),
		"policies":       repository.NewPolicyRepository(db),
		"links":          repository.NewLinkRepository(db),
	}
	app := fiber.New()
	app.Use(cors.New())
	app.Use(logger.New(logger.Config{
		Output: mw,
	}))

	route.UseRoutes(app, config.NewContext(repositoriesMap))
	config.Shutdown(app)

	port := os.Getenv("PORT")
	err = app.Listen(fmt.Sprintf(":%s", port))
	if err != nil {
		log.Fatalf("Cannot start server on port :%s due to %s", port, err)
	}
}
