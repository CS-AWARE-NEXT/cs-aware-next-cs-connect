package main

import (
	"encoding/gob"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"

	"github.com/tizianocitro/csa-server/config"
	"github.com/tizianocitro/csa-server/route"
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

	app := fiber.New()
	app.Use(cors.New())
	route.UseRoutes(app)
	config.Shutdown(app)

	port := os.Getenv("PORT")
	err = app.Listen(fmt.Sprintf(":%s", port))
	if err != nil {
		log.Fatalf("Cannot start server on port :%s due to %s", port, err)
	}
}
