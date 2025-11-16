package com.fungood.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

    private String userId;
    private String userPw;
    private String userName;
    private String email;
    private String phone;
    private Date birth;
    private String isActive;
    private Date userRegDate;
    private String userRole;

}
