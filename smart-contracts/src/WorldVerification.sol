// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title WorldVerification - Wrapper for World ID Proof Verification
/// @notice This contract wraps World ID's on-chain verification to enforce "1 human = 1 subscription".
/// @dev You can import WorldID contract interface if available, here we assume a generic verifier interface.
interface IWorldID {
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}

contract WorldVerification {
    /// @notice Address of the deployed World ID verifier contract (on World Chain)
    IWorldID public worldId;

    /// @dev Mapping to store used nullifiers (to prevent double-signaling)
    mapping(uint256 => bool) public nullifierHashes;

    /// @notice Emitted when a proof is successfully verified
    event ProofVerified(address user, uint256 nullifier);

    constructor(address _worldId) {
        worldId = IWorldID(_worldId);
    }

    /// @notice Verify a World ID proof and mark nullifier as used
    /// @param root Merkle root of the identity tree
    /// @param groupId Semaphore group ID
    /// @param signalHash Hash of the signal (often msg.sender)
    /// @param nullifierHash Unique nullifier to prevent re-use
    /// @param externalNullifierHash External action identifier
    /// @param proof Zero-knowledge proof array
    function verifyHuman(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external {
        require(!nullifierHashes[nullifierHash], "Nullifier already used");

        // Call World ID contract to verify
        worldId.verifyProof(
            root,
            groupId,
            signalHash,
            nullifierHash,
            externalNullifierHash,
            proof
        );

        // Mark nullifier as used
        nullifierHashes[nullifierHash] = true;

        emit ProofVerified(msg.sender, nullifierHash);
    }

    /// @notice Check if a nullifier has already been used
    function isVerified(uint256 nullifierHash) external view returns (bool) {
        return nullifierHashes[nullifierHash];
    }
}
