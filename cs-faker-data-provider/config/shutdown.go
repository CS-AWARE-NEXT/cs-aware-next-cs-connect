package config

import (
	"log"
	"os"
	"os/signal"

	"github.com/gofiber/fiber/v2"
)

func Shutdown(app *fiber.App) {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		_ = <-c
		log.Println("Gracefully shutting down")
		log.Println("Shutdown completed")
		_ = app.Shutdown()
	}()
}
