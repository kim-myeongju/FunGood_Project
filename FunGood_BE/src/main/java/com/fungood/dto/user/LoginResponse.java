package com.fungood.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class LoginResponse {

    private String sid;
    private String accessToken;
    private String refreshToken;
    private String loginTime;

}
