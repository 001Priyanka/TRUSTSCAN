
import { Stock } from './types';

export const MOCK_STOCKS: Stock[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', currentPrice: 2985.50, previousHigh: 2920.00, volume: 8500000, avgVolume: 4000000 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', currentPrice: 4150.10, previousHigh: 4050.00, volume: 3200000, avgVolume: 1500000 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', currentPrice: 1445.00, previousHigh: 1510.00, volume: 18000000, avgVolume: 15000000 },
  { symbol: 'INFY', name: 'Infosys Ltd.', currentPrice: 1620.00, previousHigh: 1680.00, volume: 6500000, avgVolume: 7000000 },
  { symbol: 'SBIN', name: 'State Bank of India', currentPrice: 788.50, previousHigh: 745.00, volume: 25000000, avgVolume: 12000000 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', currentPrice: 1092.10, previousHigh: 1080.00, volume: 9000000, avgVolume: 10000000 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', currentPrice: 965.00, previousHigh: 920.00, volume: 12000000, avgVolume: 5000000 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', currentPrice: 1215.00, previousHigh: 1180.00, volume: 5500000, avgVolume: 4500000 },
];

export const CONTRACT_ADDRESS = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

export const SOLIDITY_CONTRACT_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TrustScanSecurity
 * @dev Implements secure breakout archiving with integrity proofs and access control.
 */
contract TrustScanSecurity {
    address public admin;
    
    struct Signal {
        bytes32 signalHash;    // Cryptographic proof of the signal data
        string stockName;
        uint256 price;
        uint256 strength;
        uint256 timestamp;
        address archiver;      // Address that verified and pushed this signal
    }

    Signal[] private signalLedger;
    mapping(bytes32 => bool) private archivedHashes;

    event SignalSecured(bytes32 indexed signalHash, string stockName, uint256 timestamp);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Security: Access denied. Only authorized scanner node can push.");
        _;
    }

    /**
     * @dev Securely archives a signal with a unique hash to prevent data tampering.
     */
    function archiveSignal(string memory _stockName, uint256 _price, uint256 _strength) public onlyAdmin {
        // Generate a unique deterministic hash for this specific signal event
        bytes32 sHash = keccak256(abi.encodePacked(_stockName, _price, _strength, block.timestamp));
        
        require(!archivedHashes[sHash], "Security: Signal already exists in ledger.");

        signalLedger.push(Signal({
            signalHash: sHash,
            stockName: _stockName,
            price: _price,
            strength: _strength,
            timestamp: block.timestamp,
            archiver: msg.sender
        }));

        archivedHashes[sHash] = true;
        emit SignalSecured(sHash, _stockName, block.timestamp);
    }

    function getLedgerCount() public view returns (uint256) {
        return signalLedger.length;
    }

    function getSignal(uint256 index) public view returns (Signal memory) {
        return signalLedger[index];
    }
}
`;
