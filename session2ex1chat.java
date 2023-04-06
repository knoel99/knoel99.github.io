package com.isograd.exercise;
import java.util.*;

public class IsoContest {
    public static void main(String[] argv) throws Exception {
        String line;
        Scanner sc = new Scanner(System.in);
        while (sc.hasNextLine()) {
            line = sc.nextLine();
            System.out.println(findWinner(line));
        }
    }

    private static char findWinner(String input) {
        if (input == null || input.isEmpty()) {
            return ' ';
        }

        Deque<Character> players = new LinkedList<>();
        for (char c : input.toCharArray()) {
            players.add(c);
        }

        while (players.size() > 1) {
            char player1 = players.pollFirst();
            char player2 = players.pollFirst();
            char winner = determineMatchWinner(player1, player2);
            players.addFirst(winner);
        }

        return players.getFirst();
    }

    private static char determineMatchWinner(char player1, char player2) {
        if (player1 == player2) {
            return player1;
        } else if (player1 == 'P' && player2 == 'C') {
            return player1;
        } else if (player1 == 'C' && player2 == 'F') {
            return player1;
        } else if (player1 == 'F' && player2 == 'P') {
            return player1;
        } else {
            return player2;
        }
    }
}
