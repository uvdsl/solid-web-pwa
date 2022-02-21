import { ref, watch } from "vue";
import { useServiceWorkerNotifications } from "./useServiceWorkerNotifications";
import { useSolidSession } from "./useSolidSession";
import { useSolidProfile } from "./useSolidProfile";
import { getContainerItems } from "@/lib/solidRequests";

let socket: WebSocket;
const { hasActivePush } = useServiceWorkerNotifications();

const { authFetch } = useSolidSession();

const ldns = ref([] as String[]);
const { inbox } = useSolidProfile();

const update = async (uri: string) => {
    return getContainerItems(uri, authFetch.value).then((items) => {
        for (const e of ldns.value) {
            const i = items.indexOf(e.toString());
            if (i > -1) items.push(items.splice(i, 1)[0]);
        }
        ldns.value = items;
    });
};

const sub = async (uri: string) => {
    if (socket !== undefined) socket.close();
    const url = new URL(uri);
    url.protocol = "wss";

    socket = new WebSocket(url.href, ["solid-0.1"]);
    socket.onopen = function () {
        this.send(`sub ${uri}`);
        update(uri);
    };
    socket.onmessage = function (msg) {
        if (msg.data && msg.data.slice(0, 3) === "pub") {
            // resource updated, refetch resource
            console.log(msg);
            update(uri);
        }
    };
};

const updateSubscription = () => {
    if (hasActivePush.value) {
        if (socket !== undefined) socket.close();
        update(inbox.value);
    } else {
        sub(inbox.value);
    }
}


/*
 * Handle Updates
 */

navigator.serviceWorker.addEventListener('message', event => {
    update(inbox.value);
});

watch(() => inbox.value, updateSubscription)

watch(
    () => hasActivePush.value,
    () => {
        if (inbox.value == "") return;
        updateSubscription()
    },
    { immediate: true }
);


export const useSolidInbox = () => {
    return { ldns };
};
