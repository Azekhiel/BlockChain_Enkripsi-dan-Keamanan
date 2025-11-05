// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AuditableRBAC
 * @author Cerberus Project (Anda)
 * @notice Ini adalah kontrak Cerberus-Lite (Fase 1).
 */
contract AuditableRBAC is AccessControl {
    
    // --- Definisi Role (FIXED) ---
    // Menggunakan keccak256 (bukan keccak26)
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant FINANCE_ROLE = keccak256("FINANCE_ROLE");
    bytes32 public constant LOGGER_ROLE = keccak256("LOGGER_ROLE");
    bytes32 public constant KARYAWAN_ROLE = keccak256("KARYAWAN_ROLE");

    // --- Event Log (FIXED) ---
    // Menggunakan uint256 (bukan uint26)
    event AccessLogged(
        address indexed user,
        bytes32 indexed roleUsed,
        uint256 timestamp
    );

    /**
     * @notice Constructor
     */
    constructor() {
        // Memberi Anda (msg.sender) hak admin penuh atas kontrak ini.
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        // Memberi Anda hak ADMIN_ROLE dan LOGGER_ROLE awal.
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(LOGGER_ROLE, msg.sender);
        _grantRole(KARYAWAN_ROLE, msg.sender);
    }

    /**
     * @notice Mencatat upaya akses yang berhasil ke blockchain.
     * @dev Hanya bisa dipanggil oleh akun dengan LOGGER_ROLE (Backend Go Anda).
     */
    function logAccess(address _user, bytes32 _roleUsed)
        external
        onlyRole(LOGGER_ROLE)
    {
        emit AccessLogged(_user, _roleUsed, block.timestamp);
    }
}