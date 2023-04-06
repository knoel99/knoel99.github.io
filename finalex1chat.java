package com.isograd.exercise;
import java.util.*;

public class IsoContest {
    public static void main(String[] argv) throws Exception {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine());
        Map<String, Integer> hashMap = new HashMap<>();
        Map<String, Integer> timeMap = new HashMap<>();

        for (int i = 0; i < n; i++) {
            String[] submission = sc.nextLine().split(" ");
            int time = Integer.parseInt(submission[0]);
            String hash = submission[1];

            hashMap.put(hash, hashMap.getOrDefault(hash, 0) + 1);
            timeMap.putIfAbsent(hash, time);
        }

        List<Integer> uniqueTimes = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : hashMap.entrySet()) {
            if (entry.getValue() == 1) {
                uniqueTimes.add(timeMap.get(entry.getKey()));
            }
        }

        Collections.sort(uniqueTimes);
        for (Integer time : uniqueTimes) {
            System.out.println(time);
        }
    }
}
