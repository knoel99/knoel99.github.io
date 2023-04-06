package com.isograd.exercise;
import java.util.*;

public class IsoContest {
    public static void main(String[] argv) throws Exception {
        Scanner sc = new Scanner(System.in);

        int n = sc.nextInt(); // Nombre de saisons
        int k = sc.nextInt(); // Le jour dont on veut connaître la saison
        sc.nextLine(); // Lire la fin de la ligne

        int[] daysPerSeason = new int[n];
        for (int i = 0; i < n; i++) {
            daysPerSeason[i] = sc.nextInt();
        }
        sc.nextLine(); // Lire la fin de la ligne

        System.out.println(findSeason(n, k, daysPerSeason));
    }

    private static int findSeason(int n, int k, int[] daysPerSeason) {
        int totalDays = 0;
        for (int days : daysPerSeason) {
            totalDays += days;
        }

        int currentDay = k % totalDays;
        if (currentDay == 0) {
            currentDay = totalDays;
        }

        int season = 1;
        int daysPassed = 0;
        for (int days : daysPerSeason) {
            daysPassed += days;
            if (currentDay <= daysPassed) {
                return season;
            }
            season++;
        }

        return -1; // Ne devrait jamais arriver
    }
}
