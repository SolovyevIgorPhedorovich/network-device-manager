import React, { useEffect, useState } from 'react';

// Динамическая загрузка компонентов
const ConnectModal = React.lazy(() => import('./modalWindow'));
const ScanModal = React.lazy(() => import('./scanModalWindwo'));
const TerminalComponent = React.lazy(() => import('./Terminal'));

interface Device {
	id: number;
	name: string;
	model: string;
	prodeucer: string;
	location: string;
	ip: string;
	macAddr: string;
	active: boolean;
}

const DeviceList: React.FC = () => {
	// Состояние дял хранения списка устройств
	const [devices, setDevices] = useState<Device[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [expandedDeviceId, setExpandedDeviceId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [showTerminal, setShowTerminal] = useState<boolean>(false);
    const [showScanModal, setShowScanModal] = useState<boolean>(false);
    const [dataTerminal, setDataTerminal] = useState<{ username: string; password: string} | null>  (null);

	const fetchDevices = async() => {
		try {
			const response = await fetch('http://localhost:8081/devices/networkdevice/connect', {method: 'GET'})
			if (!response.ok) {
				throw new Error("Ощибка при загрузке устройств");
			}
			const data = await response.json();
			setDevices(data);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchDevices()
	}, []);


	// Обработчик для кнопки "Сканирование"
    const handleScan = async () => {
        setShowScanModal(true);
    };

    const toggleDeviceDetails = (id: number) => {
        setExpandedDeviceId(expandedDeviceId === id ? null : id);
    }

    const handleConnectClick = (device: Device) => {
        setSelectedDevice(device);
        setShowModal(true);
    }

    const handleConnectSubmit = (username: string, password: string) => {
        
        // Закрываем модальное окно
        setShowModal(false);
        setDataTerminal({username, password});
        setShowTerminal(true);

    };

    const scan = async(ipaddr:string, mask:number, port:number, community:string, snmpv:string) => {
        setShowScanModal(false)
        setLoading(true);
        setError(null);
        try {
            const url = new URL ('http://localhost:8081/devices/networkdevice/scan', window.location.origin);
            url.searchParams.append("ipaddr", ipaddr);
            url.searchParams.append("mask", mask.toString());
            url.searchParams.append("port", port.toString());
            url.searchParams.append("community", community);
            url.searchParams.append("snmpv", snmpv);
            
            console.log(url.toString())

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content_Type': 'application/json',
                }
            });

            if  (!response.ok) {
                throw new Error('ошибка сети');
            }
            
            const data = await response.json();
			setDevices(data);
        } catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
    }

    return (
        <div>
            <h1>Список устройств</h1>
            <button onClick={(e) => {e.stopPropagation(); handleScan()}} disabled={loading}>
                {loading ? 'Сканирование...' : 'Сканировать'}
            </button>
            <button onClick={() => setViewMode('grid')}>Плитки</button>
            <button onClick={() => setViewMode('list')}>Спсиок</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className={ viewMode === 'grid' ? 'grid-view' : 'list-view'}>
                {devices.map((device) => (
                    <div
                        key={device.id}
                        style={{
                            border: '1px solid #ccc',
                            padding: '10px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                        onClick={() => toggleDeviceDetails(device.id)}
                    >
                        <strong>{device.name}</strong>
                        {expandedDeviceId === device.id && (
                            <div>
                                <p>IP: {device.id}</p>
                                <p>MAC: {device.macAddr}</p>
                                <p>Расположение: {device.location}</p>
                                <p>Модель: {device.model}</p>
                                <p>Производитель: {device.prodeucer}</p>
                                <p>Статус: {device.active}</p>
                                <button onClick={(e) => {
                                        e.stopPropagation(); // Отснаваливает всплытие событий
                                        handleConnectClick(device);
                                    }
                                }
                                >Connect</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {showModal && (
            <ConnectModal
                deviceName={selectedDevice?.name || ''}
                onConnect={handleConnectSubmit}
                onClose={() => setShowModal(false)}
            />)}

            {showScanModal && (
                <ScanModal 
                    onClose={() => setShowScanModal(false)}
                    onScan={scan}
                />
            )}
            
            {showTerminal && selectedDevice && dataTerminal && (
                <div>
                    <h1> SSH Console</h1>
                    <TerminalComponent
                        deviceName={selectedDevice.name}
                        ip={selectedDevice.ip}
                        username={dataTerminal.username}
                        password={dataTerminal.password}>
                    </TerminalComponent>
                    <button onClick={() => setShowTerminal(false)}/>
                </div>
            )}
        </div>
    );
};

export default DeviceList;
