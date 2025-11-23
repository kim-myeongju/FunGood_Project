package com.fungood.mapper;

import com.fungood.dto.user.SignUpRequest;
import com.fungood.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {

    User findUserByUserId(String userId);
    User findUserByEmail(String email);
    User findUserByPhone(String phone);
    int insertUser(SignUpRequest user);

}
