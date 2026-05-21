package com.example.fullstack2.Controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping({"/", "/about", "/announcements", "/announcements/create", "/create", "/login", "/register", "/profile"})
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
