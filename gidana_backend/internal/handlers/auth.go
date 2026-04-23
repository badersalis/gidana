package handlers

import (
	"strings"
	"time"

	"github.com/badersalis/gidana_backend/internal/database"
	"github.com/badersalis/gidana_backend/internal/models"
	"github.com/badersalis/gidana_backend/internal/utils"
	"github.com/gin-gonic/gin"
)

type RegisterInput struct {
	FirstName   string `json:"first_name" binding:"required"`
	LastName    string `json:"last_name" binding:"required"`
	Email       string `json:"email"`
	PhoneNumber string `json:"phone_number"`
	Password    string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
	Identifier string `json:"identifier" binding:"required"` // email or phone
	Password   string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	if input.Email == "" && input.PhoneNumber == "" {
		utils.BadRequest(c, "Email or phone number is required")
		return
	}

	hash, err := utils.HashPassword(input.Password)
	if err != nil {
		utils.InternalError(c, "Failed to hash password")
		return
	}

	user := models.User{
		FirstName:    input.FirstName,
		LastName:     input.LastName,
		Email:        input.Email,
		PhoneNumber:  input.PhoneNumber,
		PasswordHash: hash,
		MemberSince:  time.Now(),
		Active:       true,
		Locale:       "fr",
	}

	if err := database.DB.Create(&user).Error; err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "UNIQUE") {
			utils.BadRequest(c, "Email or phone number already registered")
			return
		}
		utils.InternalError(c, "Failed to create account")
		return
	}

	token, _ := utils.GenerateToken(user.ID, user.Email)
	utils.Created(c, gin.H{"user": user, "token": token})
}

func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	var user models.User
	identifier := strings.TrimSpace(input.Identifier)

	result := database.DB.Where("email = ? OR phone_number = ?", identifier, identifier).First(&user)
	if result.Error != nil {
		utils.Unauthorized(c, "Invalid credentials")
		return
	}

	if !utils.CheckPassword(input.Password, user.PasswordHash) {
		utils.Unauthorized(c, "Invalid credentials")
		return
	}

	token, _ := utils.GenerateToken(user.ID, user.Email)
	utils.OK(c, gin.H{"user": user, "token": token})
}

func GetMe(c *gin.Context) {
	user, _ := c.Get("user")
	utils.OK(c, user)
}
