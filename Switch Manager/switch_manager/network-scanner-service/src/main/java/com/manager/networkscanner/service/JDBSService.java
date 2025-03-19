package com.manager.networkscanner.service;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.manager.networkscanner.model.NetworkDevice;

@Service
public class JDBSService {
    
    @Autowired
    JdbcTemplate jdbcTemplate;

    private String insertSql(String tableName, List<String> colNames){
        String columns = String.join(", ", colNames);
        return String.format("INSERT INTO %s (%s) VALUES (?, ?, CAST(? AS inet), CAST(? AS macaddr), ?, ?, ?) ON CONFLICT (macaddr) DO NOTHING", tableName, columns);
    }

    private String insertSql(String tableName, String rowName, String value){
        return String.format("INSERT INTO %s (%s) VALUES ('%s')", tableName, rowName, value);
    }

    private String insertAndReturingSql(String tableName, String rowName, String value){
        return String.format("INSERT INTO %s (%s) VALUES ('%s') RETURNING id", tableName, rowName, value);
    }

    private String selectSql(String tableName, String rowName, String value){
        return String.format("SELECT %s FROM %s WHERE %s = '%s'", "id", tableName, rowName, value );
    }

    private String selectSql(String tableName, List<String> values){
        StringBuilder sql = new StringBuilder("SELECT ");
        int i = 1;
        if (values != null){
            for (String value : values) {
                if (i != values.size()){
                    sql.append(value + ", ");
                } else {
                    sql.append(value + " ");
                }
                i++;
            }
        } else {
            sql.append("* ");
        }
        sql.append("FROM " + tableName + " ORDER BY id ASC ");
        return sql.toString();
    }

    public List<NetworkDevice>  getNetworkDevices(String tableName, List<String> values){
        List<NetworkDevice> networkDevices = new ArrayList<>();
        jdbcTemplate.query(selectSql(tableName, values), (rs, __) -> networkDevices.add(new NetworkDevice(
            rs.getInt("id"),
            rs.getString("ip_addr"),
            rs.getString("name"),
            rs.getString("model"),
            rs.getString("macaddr"),
            rs.getString("location"),
            rs.getString("producer")
        )));
        return networkDevices;
    }

    public void addDataDeviece(String tableName, List<String> colName, List<NetworkDevice> values)
    {
        jdbcTemplate.batchUpdate(insertSql(tableName, colName), values, values.size(), this::setValuesToinsert);
    }

    private void setValuesToinsert(PreparedStatement ps, NetworkDevice device) throws SQLException {
        ps.setString(1, device.getName());
        ps.setInt(2, getOrInsert("models_switches", "name", device.getModel()));
        // Преобразование IP-адреса в строку
        try {
            InetAddress inetAddress = InetAddress.getByName(device.getIp());
            ps.setString(3, inetAddress.getHostAddress()); // Устанавливаем IP-адрес как строку
        } catch (UnknownHostException e) {
            throw new SQLException("Неверный IP-адрес: " + device.getIp(), e);
        }
        ps.setString(4, device.getMACAddres());
        ps.setString(5, device.getLocation());
        ps.setInt(6, getOrInsert("producer_switches", "name", device.getProducer()));
        ps.setBoolean(7, true);
    }

    private Integer getOrInsert(String tableName, String rowName, String value) {
        return jdbcTemplate.query(selectSql(tableName, rowName, value), rs -> {
            if (rs.next()) {
                return rs.getInt("id");
            } else {
                return jdbcTemplate.queryForObject(insertAndReturingSql(tableName, rowName, value), Integer.class);
            }
        });
    }

}
