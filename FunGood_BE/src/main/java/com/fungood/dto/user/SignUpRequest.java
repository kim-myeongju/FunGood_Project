package com.fungood.dto.user;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class SignUpRequest {

    private String userId;
    private String userPw;
    private String userName;
    private String email;
    private String phone;
    private LocalDate birth;

}
