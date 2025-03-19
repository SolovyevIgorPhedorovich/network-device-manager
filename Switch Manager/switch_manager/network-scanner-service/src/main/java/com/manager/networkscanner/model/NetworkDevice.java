package com.manager.networkscanner.model;

public class NetworkDevice {
    private int id;
    private String ip;
    private String name;
    private String model;
    private String macaddr;
    private String location;
    private String producer;
    
    public NetworkDevice(){} 

    public NetworkDevice(int id, String ip, String name, String model, String macaddr, String location, String produser){
        this.id = id;
        this.ip = ip;
        this.name = name;
        this.model = model;
        this.macaddr = macaddr;
        this.location = location;
        this.producer = produser;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public void setMACAddres(String macaddr) {
        this.macaddr = macaddr;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setProducer(String producer) {
        this.producer = producer;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getName() {
        return name;
    }

    public String getModel() {
        return model;
    }

    public String getMACAddres() {
        return macaddr;
    }

    public String getLocation() {
        return location;
    }

    public String getProducer() {
        return producer;
    }

    public String getIp() {
        return ip;
    }

    public int getId() {
        return id;
    }
}
