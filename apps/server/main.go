package main

import (
    "github.com/gofiber/fiber/v2"
    "os"
)

func main() {
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    app := fiber.New()

    // REST example
    app.Post("/api/action", func(c *fiber.Ctx) error {
        return c.SendString("Action received")
    })

    // Serve static frontend in prod
    app.Static("/", "./client/dist")

    app.Listen(":" + port)
}
