package controller

import (
	"encoding/json"
	"log"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/service"
	"github.com/gofiber/fiber/v2"
)

type ChannelController struct {
	authService *service.AuthService
	endpoint    string
}

func NewChannelController(
	authService *service.AuthService,
	endpoint string,
) *ChannelController {
	return &ChannelController{
		authService: authService,
		endpoint:    endpoint,
	}
}

func (cc *ChannelController) ExportChannel(c *fiber.Ctx, vars map[string]string) error {
	channel := model.STIXChannel{}
	err := json.Unmarshal(c.Body(), &channel)
	if err != nil {
		return c.JSON(model.BaseResponse{
			Success: false,
			Message: "Not a valid channel provided",
		})
	}
	channelExporter := service.NewJSONChannelExporter(
		vars["ecosystemId"],
		cc.endpoint,
		cc.authService,
	)
	jsonChannel, err := channelExporter.ExportChannel(
		channel,
		vars,
	)
	if err != nil {
		log.Printf("Could not export channel: %s", err.Error())
		return c.JSON(model.BaseResponse{
			Success: false,
			Message: err.Error(),
		})
	}
	log.Printf("Exported channel %s", jsonChannel.Name)
	return c.JSON(model.BaseResponse{
		Success: true,
		Message: "Channel exported successfully",
	})
}
