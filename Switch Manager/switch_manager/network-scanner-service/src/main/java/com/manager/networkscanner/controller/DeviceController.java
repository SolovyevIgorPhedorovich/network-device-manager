package com.manager.networkscanner.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.manager.networkscanner.model.NetworkDevice;
import com.manager.networkscanner.service.JDBSService;

@RestController
public class DeviceController {

    @Autowired
    JDBSService jdbsService;

    @CrossOrigin(origins = "http://localhost:8081")
    @GetMapping("/networkdevice/connect")
    public List<NetworkDevice> scanNetworl() throws Exception {
        return jdbsService.getNetworkDevices("public.network_switches", new ArrayList<>(Arrays.asList("*")));
    }

}
