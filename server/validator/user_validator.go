package validator

import (
	"errors"
	"regexp"
	"server/model"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type IUserValidator interface {
	UserValidate(user model.User) error
}

type userValidator struct{}

func NewUserValidator() IUserValidator {
	return &userValidator{}
}

func (uv *userValidator) UserValidate(user model.User) error {
	return validation.ValidateStruct(&user,
		validation.Field(
			&user.UserId,
			validation.Required.Error("userID is required"),
			validation.RuneLength(3, 30).Error("limited min 3 max 30 char"),
			validation.By(isValidUserID),
		),
		validation.Field(
			&user.Password,
			validation.Required.Error("password is required"),
			validation.RuneLength(6, 30).Error("limited min 6 max 30 char"),
		),
	)
}

func isValidUserID(value interface{}) error {
    userID, ok := value.(string)
    if !ok {
        return errors.New("invalid type")
    }
    re := regexp.MustCompile(`^[a-zA-Z0-9]+$`)
    if !re.MatchString(userID) {
        return errors.New("is not valid userID format")
    }
    return nil
}