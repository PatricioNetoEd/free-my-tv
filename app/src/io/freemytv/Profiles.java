package io.freemytv;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.text.Editable;
import android.text.InputFilter;
import android.text.Spanned;
import android.text.TextWatcher;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;

import java.util.ArrayList;
import java.util.List;

/**
 * The household's local profiles (card 214a): each one has a name, a color, the tab the home screen starts on, a kids
 * mark (214c) and its own shelf and hidden Continue Watching items. Not a Google account, no password.
 *
 * Profile 0 is the Main one: its shelf is the `shelf` key every version used, so a TV that updates keeps its row and
 * nothing is written just by opening this version (no `profiles` key means [0]). The others' keys end in ".<id>"; ids
 * are never reused, so a new profile can't inherit a deleted one's leftovers.
 *
 * Only :home reads or changes them (the home screen and Home Settings). Every write is quiet: Prefs.version stays, so
 * HomeActivity doesn't start over; `stamp` tells HomeView to apply the change in place when it shows again.
 */
final class Profiles {
    private Profiles() {}

    static final int MAIN = 0, MAX = 6, NAME_MAX = 12;
    /** design/tokens-v2.json → profile.palette (gold in place of red), in the order new profiles take them. */
    static final int[] COLORS = {0xFF3563E0, 0xFFD0215F, 0xFF2E7D32, 0xFFC2410C, 0xFF8550D8, 0xFF00796B, 0xFF856A00, 0xFF5F6E88};
    /** The starting tabs, as HomeView's: Explore, Movies, Shows. */
    static final int TABS = 3;
    /** The kids mark's value when on (214c reads it; "L" may come later without migrating). */
    static final String KIDS_ON = "10";

    /** Bumped by every change here (UI thread, :home): HomeView applies what changed when it shows (as Prefs.lookChanges). */
    static int stamp;

    private static SharedPreferences sp() {
        return Prefs.context().getSharedPreferences("settings", Context.MODE_PRIVATE);
    }

    /** The profiles' ids in order; [0] until a second one is created. */
    static List<Integer> list() {
        List<Integer> out = new ArrayList<>();
        String v = sp().getString("profiles", null);
        if (v != null) {
            for (String s : v.split(",")) {
                try {
                    int id = Integer.parseInt(s.trim());
                    if (id >= 0 && !out.contains(id)) out.add(id);
                } catch (NumberFormatException ignored) {
                }
            }
        }
        if (!out.contains(MAIN)) out.add(0, MAIN);
        return out;
    }

    /** The profile in use: one in the list, else the Main one. */
    static int active() {
        int id = sp().getInt("profile", MAIN);
        return id == MAIN || list().contains(id) ? id : MAIN;
    }

    /** "" for the Main profile (today's keys), ".<id>" for the others. */
    static String suffix(int id) {
        return id == MAIN ? "" : "." + id;
    }

    /** As saved; the Main one's empty name shows as "Main" in the TV's language. */
    static String name(int id) {
        String v = sp().getString("profile." + id + ".name", "");
        return v.isEmpty() && id == MAIN ? Ui.tr("profile|Main") : v;
    }

    /** A palette index (0 to 7). */
    static int color(int id) {
        int c = sp().getInt("profile." + id + ".color", id == MAIN ? 0 : -1);
        return c >= 0 && c < COLORS.length ? c : 0;
    }

    static int colorValue(int id) {
        return COLORS[color(id)];
    }

    /** The palette's names, for the Color row and TalkBack (the color is never the only cue). */
    static String colorName(int index) {
        switch (index) {
            case 0: return Ui.tr("color|Blue");
            case 1: return Ui.tr("color|Pink");
            case 2: return Ui.tr("color|Green");
            case 3: return Ui.tr("color|Orange");
            case 4: return Ui.tr("color|Purple");
            case 5: return Ui.tr("color|Teal");
            case 6: return Ui.tr("color|Gold");
            default: return Ui.tr("color|Slate");
        }
    }

    /** The tab the home screen starts on (Home and a switch go there): 0 Explore, 1 Movies, 2 Shows. */
    static int tab(int id) {
        int t = sp().getInt("profile." + id + ".tab", 0);
        return t >= 0 && t < TABS ? t : 0;
    }

    static int startTab() {
        return tab(active());
    }

    /** "" (off) or the kids mark ("10"): saved only, the picks' filter is card 214c's. */
    static String kids(int id) {
        return sp().getString("profile." + id + ".kids", "");
    }

    /**
     * The first letter or digit of the name, by code point, uppercased in the app's language. CJK and Devanagari come
     * out as they are (the system font draws them, as the rest of that text).
     */
    static String initial(int id) {
        String name = name(id);
        for (int i = 0; i < name.length(); ) {
            int cp = name.codePointAt(i);
            if (Character.isLetterOrDigit(cp)) return new String(Character.toChars(cp)).toUpperCase(Ui.locale());
            i += Character.charCount(cp);
        }
        return "?";
    }

    /** A name as it's kept: trimmed, at most NAME_MAX code points; "" when it has no letter or digit. */
    static String clean(String typed) {
        String s = typed == null ? "" : typed.trim();
        if (s.codePointCount(0, s.length()) > NAME_MAX) s = s.substring(0, s.offsetByCodePoints(0, NAME_MAX)).trim();
        boolean any = false;
        for (int i = 0; i < s.length() && !any; ) {
            int cp = s.codePointAt(i);
            any = Character.isLetterOrDigit(cp);
            i += Character.charCount(cp);
        }
        return any ? s : "";
    }

    static boolean full() {
        return list().size() >= MAX;
    }

    // MARK: - Changes (UI thread, :home)

    /** Switches profile; HomeView applies it in place when it shows (no recreate, nothing fetched). */
    static void setActive(int id) {
        if (id == active() || !list().contains(id)) return;
        sp().edit().putInt("profile", id).apply();
        stamp++;
    }

    static void rename(int id, String typed) {
        String name = clean(typed);
        if (name.isEmpty()) return;
        sp().edit().putString("profile." + id + ".name", name).apply();
        stamp++;
    }

    static void setColor(int id, int index) {
        sp().edit().putInt("profile." + id + ".color", Math.max(0, Math.min(COLORS.length - 1, index))).apply();
        stamp++;
    }

    static void setTab(int id, int tab) {
        sp().edit().putInt("profile." + id + ".tab", Math.max(0, Math.min(TABS - 1, tab))).apply();
        stamp++;
    }

    static void setKids(int id, boolean on) {
        SharedPreferences.Editor e = sp().edit();
        if (on) e.putString("profile." + id + ".kids", KIDS_ON);
        else e.remove("profile." + id + ".kids");
        e.apply();
        stamp++;
    }

    /**
     * A new profile named `typed`, with a copy of the current profile's resolved shelf (the built-in list when it was
     * never edited), its starting tab and the first color no profile uses. Not a kids profile; nothing hidden from
     * Continue Watching. Returns its id, or -1 (6 already, or a name without a letter or digit). The caller makes it the
     * active one (owner, 2026-11-02). `shelf` is HomeApps.shelfPackages(c, active()), resolved off the UI thread (with
     * the built-in list, ~30 PackageManager queries).
     */
    static int create(String typed, List<String> shelf) {
        String name = clean(typed);
        List<Integer> ids = list();
        if (name.isEmpty() || ids.size() >= MAX) return -1;
        SharedPreferences sp = sp();
        int id = Math.max(1, sp.getInt("profileNext", 1));
        for (int used : ids) id = Math.max(id, used + 1);
        boolean[] taken = new boolean[COLORS.length];
        for (int used : ids) taken[color(used)] = true;
        int color = 0;
        while (color < COLORS.length - 1 && taken[color]) color++;
        if (taken[color]) color = ids.size() % COLORS.length;   // all eight in use: can't happen with 6 at most
        int current = active();
        StringBuilder order = new StringBuilder();
        for (int used : ids) order.append(order.length() == 0 ? "" : ",").append(used);
        order.append(',').append(id);
        sp.edit()
                .putString("profiles", order.toString())
                .putInt("profileNext", id + 1)
                .putString("profile." + id + ".name", name)
                .putInt("profile." + id + ".color", color)
                .putInt("profile." + id + ".tab", tab(current))
                .putString("shelf" + suffix(id), join(shelf))
                .apply();
        stamp++;
        return id;
    }

    /**
     * Deletes a profile (never the Main one): its shelf, its hidden items and its name, color, tab and mark. Apps
     * aren't touched (nothing is uninstalled, turned off or cleared). The active one switches to the Main one first.
     */
    static void delete(int id) {
        if (id == MAIN) return;
        if (active() == id) setActive(MAIN);
        List<Integer> ids = list();
        ids.remove(Integer.valueOf(id));
        StringBuilder order = new StringBuilder();
        for (int used : ids) order.append(order.length() == 0 ? "" : ",").append(used);
        sp().edit()
                .putString("profiles", order.toString())
                .remove("shelf" + suffix(id))
                .remove("watchHidden" + suffix(id))
                .remove("profile." + id + ".name")
                .remove("profile." + id + ".color")
                .remove("profile." + id + ".tab")
                .remove("profile." + id + ".kids")
                .apply();
        stamp++;
    }

    static String join(List<String> list) {
        StringBuilder sb = new StringBuilder();
        for (String p : list) sb.append(sb.length() == 0 ? "" : ",").append(p);
        return sb.toString();
    }

    // MARK: - The name dialog (Home Settings; 214b's "Add" on the sheet uses it too)

    interface Named {
        void done(String name);
    }

    /**
     * Asks for a name with the TV's keyboard: up to 12 characters, OK only once it has a letter or a digit. `done`
     * gets the cleaned name; Cancel or Back call nothing. Returns the dialog, for the screen to dismiss it when it closes
     * (nothing is saved then, as with Cancel).
     */
    static AlertDialog askName(Activity a, String title, String current, Named done) {
        EditText field = new EditText(a);
        field.setSingleLine(true);
        field.setHint(Ui.tr("Profile name"));
        field.setImeOptions(EditorInfo.IME_ACTION_DONE);
        field.setFilters(new InputFilter[] {CODE_POINTS});
        if (current != null) {
            field.setText(current);
            field.setSelection(field.getText().length());
        }
        AlertDialog dialog = new AlertDialog.Builder(a, android.R.style.Theme_DeviceDefault_Dialog_Alert)
                .setTitle(title)
                .setView(field)
                .setPositiveButton(Ui.tr("Save"), (d, which) -> {
                    String name = clean(field.getText().toString());
                    if (!name.isEmpty()) done.done(name);
                })
                .setNegativeButton(Ui.tr("Cancel"), null)
                .create();
        field.setOnEditorActionListener((v, action, event) -> {
            String name = clean(field.getText().toString());
            if (name.isEmpty()) return true;   // the keyboard stays: nothing to save yet
            dialog.dismiss();
            done.done(name);
            return true;
        });
        dialog.show();
        Button ok = dialog.getButton(AlertDialog.BUTTON_POSITIVE);
        ok.setEnabled(!clean(field.getText().toString()).isEmpty());
        field.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {}
            @Override public void afterTextChanged(Editable s) { ok.setEnabled(!clean(s.toString()).isEmpty()); }
        });
        return dialog;
    }

    /** At most NAME_MAX code points (an emoji or a CJK character outside the BMP counts once). */
    private static final InputFilter CODE_POINTS = new InputFilter() {
        @Override public CharSequence filter(CharSequence source, int start, int end, Spanned dest, int dstart, int dend) {
            int kept = Character.codePointCount(dest, 0, dest.length()) - Character.codePointCount(dest, dstart, dend);
            int room = NAME_MAX - kept;
            int adding = Character.codePointCount(source, start, end);
            if (adding <= room) return null;
            if (room <= 0) return "";
            int cut = Character.offsetByCodePoints(source, start, room);
            return source.subSequence(start, cut);
        }
    };
}
