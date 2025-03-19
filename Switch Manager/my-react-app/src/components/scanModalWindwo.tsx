import { useState } from "react";
import './ConnectModal.css';

interface ScanModalProps {
    onScan: (ipaddr: string, mask: number, port: number, community: string, snmpv:string) => void;
    onClose: () => void;
}

const snmpVersions:string[] = ["v1", "v2c", "v3"]


const ScanModal: React.FC<ScanModalProps> = ({ onScan, onClose }) => {
    const [ipaddr, setIPAddr] = useState<string>('');
    const [mask, setMask] = useState<number>(24);
    const [port, setPort] = useState<number>(161);
    const [community, setCommunity] = useState<string>('public');
    const [snmpv, setSNMPVersion] = useState<string> ('v1');

    const handleSubmit = () => {
        onScan(ipaddr, mask, port, community, snmpv);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Сканирование сети</h2>
                <input
                    type="text"
                    placeholder="IP"
                    value={ipaddr}
                    onChange={(e) => setIPAddr(e.target.value)}
                    className="modal-input"
                />
                <input
                    type="number"
                    placeholder="Маска сети"
                    value={mask}
                    onChange={(e) => setMask(parseInt(e.target.value))}
                    className="modal-input"
                />
                <input
                    type="number"
                    placeholder="Порт"
                    value={port}
                    onChange={(e) => setPort(parseInt(e.target.value))}
                    className="modal-input"
                />
                <input
                    type="text"
                    placeholder="SNMP community:"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="modal-input"
                />
                <select 
                    onChange={(e) => setSNMPVersion(e.target.value)}
                    className="modal-input"
                    title="SNMP version:">
                    {snmpVersions.map((v, index) => (
                        <option key={index} value={v}>
                            {v}
                        </option>
                    ))}
                </select>
                <button onClick={handleSubmit} className="modal-button scan-button">
                    Сканировать
                </button>
                <button onClick={onClose} className="modal-button cancel-button">
                    Отмена
                </button>
            </div>
        </div>
    );
};

export default ScanModal;