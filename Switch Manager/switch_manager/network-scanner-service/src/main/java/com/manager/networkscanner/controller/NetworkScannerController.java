package com.manager.networkscanner.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.manager.networkscanner.model.NetworkDevice;
import com.manager.networkscanner.service.NetworkScannerService;


@RestController
public class NetworkScannerController {
    
    @Autowired
    NetworkScannerService networlScanner;

    @GetMapping("/networkdevice/scan")
    public List<NetworkDevice> scanNetworl(
        @RequestParam("ipaddr") String ipaddr,
        @RequestParam("mask") int mask,
        @RequestParam("port") int port,
        @RequestParam("community") String community,
        @RequestParam("snmpv") String snmpv) throws Exception {
        return networlScanner.scan(ipaddr, mask, port, community, snmpv);
    }
}
