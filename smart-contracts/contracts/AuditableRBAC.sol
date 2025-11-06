// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AuditableRBAC 
 * @author Moli-Milo Project
 * @notice Kontrak Moli-Milo — RBAC + Logging + Budget (Kuota)
 * @dev Fitur Policy (Waktu) dinonaktifkan di level kontrak, diurus oleh Backend.
 */
contract AuditableRBAC is AccessControl {
    // --- Definisi Role ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant FINANCE_ROLE = keccak256("FINANCE_ROLE");
    bytes32 public constant LOGGER_ROLE = keccak256("LOGGER_ROLE");
    bytes32 public constant KARYAWAN_ROLE = keccak256("KARYAWAN_ROLE");

    // --- Event Log ---
    event AccessLogged(address indexed user, bytes32 indexed roleUsed, uint256 timestamp);

    // events for admin actions
    // event RolePolicySet(bytes32 indexed role, uint256 startTime, uint256 endTime); // [FITUR POLICY DIKOMEN]
    event RoleBudgetSet(bytes32 indexed role, uint256 budget);

    // --- FITUR BARU (Fase 2: Policy & Budget) ---
    /* // [FITUR POLICY DIKOMEN]
    struct RolePolicy {
        uint256 startTime; // 0 = tidak ada batasan bawah
        uint256 endTime;   // 0 = tidak ada batasan atas
    }
    */

    // mapping(bytes32 => RolePolicy) public rolePolicies; // [FITUR POLICY DIKOMEN]
    mapping(bytes32 => uint256) public roleApiRemaining;

    // --- Constructor ---
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        // untuk testing awal, beri semua role ke deployer
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(LOGGER_ROLE, msg.sender);
        _grantRole(KARYAWAN_ROLE, msg.sender);
        _grantRole(FINANCE_ROLE, msg.sender);
    }

    // --- ADMIN FUNCTIONS (Fase 2) ---
    /* // [FITUR POLICY]
    function setRolePolicy(bytes32 _role, uint256 _startTime, uint256 _endTime)
        external
        onlyRole(ADMIN_ROLE)
    {
        // Validasi rentang: jika keduanya non-zero, start <= end
        if (_startTime != 0 && _endTime != 0) {
            require(_startTime <= _endTime, "startTime > endTime");
        }
        rolePolicies[_role] = RolePolicy(_startTime, _endTime);
        emit RolePolicySet(_role, _startTime, _endTime);
    }
    */

    function setRoleBudget(bytes32 _role, uint256 _budget)
        external
        onlyRole(ADMIN_ROLE)
    {
        roleApiRemaining[_role] = _budget;
        emit RoleBudgetSet(_role, _budget);
    }

    // --- VIEW FUNCTIONS (Fase 2) ---
    /* // [FITUR POLICY DIKOMEN]
    function checkPolicy(bytes32 _role) public view returns (bool) {
        RolePolicy memory policy = rolePolicies[_role];

        // no constraints
        if (policy.startTime == 0 && policy.endTime == 0) return true;

        // start only (no upper bound)
        if (policy.startTime != 0 && policy.endTime == 0) {
            return block.timestamp >= policy.startTime;
        }

        // end only (no lower bound)
        if (policy.startTime == 0 && policy.endTime != 0) {
            return block.timestamp <= policy.endTime;
        }

        // both bounds present
        return (block.timestamp >= policy.startTime && block.timestamp <= policy.endTime);
    }
    */

    function checkBudget(bytes32 _role) public view returns (bool) {
        return roleApiRemaining[_role] > 0;
    }

    // --- LOGGER (Di-upgrade) ---
    // internal helper to decrement budget and emit log
    function _decrementAndEmit(address _user, bytes32 _roleUsed) internal {
        uint256 currentBudget = roleApiRemaining[_roleUsed];
        if (currentBudget > 0) {
            roleApiRemaining[_roleUsed] = currentBudget - 1;
        }
        emit AccessLogged(_user, _roleUsed, block.timestamp);
    }

    /**
     * @notice Mencatat akses dan mengurangi kuota (dipanggil oleh logger backend).
     * @dev Keharusan: caller harus memiliki LOGGER_ROLE.
     */
    function logAccessAndDecrement(address _user, bytes32 _roleUsed)
        external
        onlyRole(LOGGER_ROLE)
    {
        _decrementAndEmit(_user, _roleUsed);
    }

    /**
     * @notice Fungsi logAccess lama (deprecated) — tetap dipertahankan untuk kompatibilitas.
     * @dev Tidak menggunakan `this.`; memanggil internal helper agar tidak kena masalah akses.
     */
    function logAccess(address _user, bytes32 _roleUsed)
        external
        onlyRole(LOGGER_ROLE)
    {
        _decrementAndEmit(_user, _roleUsed);
    }
}