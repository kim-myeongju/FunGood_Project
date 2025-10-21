package com.fungood.mapper;

import com.fungood.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {

    User findUserByUserId(String userId);

}
