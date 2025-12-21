// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Score {
    struct MatchScore {
        uint256 matchId;
        string player1;
        string player2;
        uint256 score1;
        uint256 score2;
        uint256 timestamp;
    }

    MatchScore[] public scores;
    address public owner;

    event ScoreRecorded(uint256 matchId, string player1, string player2, uint256 score1, uint256 score2);

    constructor() {
        owner = msg.sender;
    }

    function recordScore(uint256 _matchId, string memory _player1, string memory _player2, uint256 _score1, uint256 _score2) public {
        require(msg.sender == owner, "Only owner can record scores");
        scores.push(MatchScore(_matchId, _player1, _player2, _score1, _score2, block.timestamp));
        emit ScoreRecorded(_matchId, _player1, _player2, _score1, _score2);
    }

    function getScoreCount() public view returns (uint256) {
        return scores.length;
    }
}
