/*
 * Copyright 2020 Jason H House
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

package com.jasonhhouse.gaps.properties;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.jasonhhouse.gaps.NotificationType;
import java.util.Collections;
import java.util.List;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public final class PushOverProperties extends AbstractNotificationProperties {

    @NotNull
    private final String token;
    @NotNull
    private final String user;
    @NotNull
    private final Integer priority;
    @NotNull
    private final String sound;
    @NotNull
    private final Integer retry;
    @NotNull
    private final Integer expire;

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public PushOverProperties(@JsonProperty(value = "enabled", required = true) @NotNull Boolean enabled,
                              @JsonProperty(value = "notificationTypes", required = true) @NotNull List<NotificationType> notificationTypes,
                              @JsonProperty(value = "token") @Nullable String token,
                              @JsonProperty(value = "user") @Nullable String user,
                              @JsonProperty(value = "priority") @Nullable Integer priority,
                              @JsonProperty(value = "sound") @Nullable String sound,
                              @JsonProperty(value = "retry") @Nullable Integer retry,
                              @JsonProperty(value = "expire") @Nullable Integer expire) {
        super(enabled, notificationTypes);
        this.token = token == null ? "" : token;
        this.user = user == null ? "" : user;
        this.priority = priority == null ? Integer.MIN_VALUE : priority;
        this.sound = sound == null ? "" : sound;
        this.retry = retry == null ? Integer.MIN_VALUE : retry;
        this.expire = expire == null ? Integer.MIN_VALUE : expire;
    }

    static PushOverProperties getDefault() {
        return new PushOverProperties(false, Collections.emptyList(), "", "", Integer.MIN_VALUE, "", Integer.MIN_VALUE, Integer.MIN_VALUE);
    }

    public @NotNull String getToken() {
        return token;
    }

    public @NotNull String getUser() {
        return user;
    }

    public @NotNull Integer getPriority() {
        return priority;
    }

    public @NotNull String getSound() {
        return sound;
    }

    @NotNull
    public Integer getRetry() {
        return retry;
    }

    @NotNull
    public Integer getExpire() {
        return expire;
    }

    @Override
    public String toString() {
        return "PushOverProperties{" +
                "token='" + token + '\'' +
                ", user='" + user + '\'' +
                ", priority=" + priority +
                ", sound='" + sound + '\'' +
                ", retry=" + retry +
                ", expire=" + expire +
                ", enabled=" + enabled +
                ", notificationTypes=" + notificationTypes +
                '}';
    }
}
